exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "POST 요청만 허용됩니다.",
      }),
    };
  }

  try {
    const secretKey = process.env.TOSS_SECRET_KEY;

    if (!secretKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.",
        }),
      };
    }

    const { paymentKey, orderId, amount } = JSON.parse(event.body || "{}");

    if (!paymentKey || !orderId || !amount) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "paymentKey, orderId, amount가 필요합니다.",
        }),
      };
    }

    const authorization = Buffer.from(`${secretKey}:`).toString("base64");

    const tossResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authorization}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const result = await tossResponse.json();

    return {
      statusCode: tossResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("결제 승인 오류:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "결제 승인 처리 중 오류가 발생했습니다.",
      }),
    };
  }
};
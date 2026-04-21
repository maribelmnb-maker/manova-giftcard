const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    const { packName, price, recipientName, senderName, scheduleInfo, giftCode, siteUrl, orderToken } = body;

    const preference = {
      items: [
        {
          title: `Manova - ${packName} para ${recipientName}`,
          description: `Tarjeta Regalo Manova Beauty Center · ${scheduleInfo}`,
          unit_price: Number(price),
          quantity: 1,
          currency_id: "MXN",
        },
      ],
      back_urls: {
        success: `${siteUrl}?paid=1&code=${giftCode}`,
        failure: `${siteUrl}?paid=0`,
        pending: `${siteUrl}?paid=pending`,
      },
      auto_return: "approved",
      statement_descriptor: "MANOVA BEAUTY",
      external_reference: giftCode,
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const err = await mpRes.text();
      throw new Error(`MP Error ${mpRes.status}: ${err}`);
    }

    const pref = await mpRes.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ init_point: pref.init_point, id: pref.id }),
    };
  } catch (err) {
    console.error("create-preference error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

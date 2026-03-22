// src/lib/email.ts
import emailjs from "@emailjs/browser";

export const sendTradeAlert = async (data: {
  to_email: string;
  name : string;
  symbol : string;
  signal: string;
  price: string;
  time: string;
  strategy: string;
}) => {
  try {
    const response = await emailjs.send(
      "YOUR_SERVICE_ID",
      "YOUR_TEMPLATE_ID",
      {
        to_email: data.to_email,
         name: data.name, 
        symbol: data.symbol,
        signal: data.signal,
        price: data.price,
        time: data.time,
        strategy: data.strategy,
      },
      "YOUR_PUBLIC_KEY"
    );

    console.log("Email sent:", response);
  } catch (error) {
    console.error("Email error:", error);
  }
};
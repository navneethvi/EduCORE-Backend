import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "auth-service",
  brokers: ["127.0.0.1:9092"],
});

export const producer = kafka.producer();

export const connectProducer = async () => {
  try {
    await producer.connect();
    console.log("Connected to Kafka producer");
  } catch (error) {
    console.error("Error connecting to Kafka producer:", error);
  }
};

export const sendMessage = async (topic: string, message: any) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message sent to topic ${topic}:`, message);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

const run = async () => {
  await connectProducer();
  await sendMessage("test-topic", { hello: "world" });
};

run();
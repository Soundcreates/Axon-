import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

const uploadFile = async (file) => {
  try {
    const fileBuffer = Buffer.from(file.data, 'base64');
    const fileName = file.name;

    const upload = await pinata.upload.file(fileBuffer, {
      metadata: { name: fileName },
    });

    process.env.PROJECT_MODE === "development" && 
      console.log("File uploaded to IPFS using pinata:", upload);
    return upload;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};

export default uploadFile;
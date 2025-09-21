import { create } from 'ipfs-http-client';

const projectId = process.env.INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export const uploadFile = async (fileBuffer) => {
  try{
    const result = await ipfs.add(fileBuffer);
    console.log("IPFS file uploaded: ", result.path);
    return result.path; //this is the hash
  }catch(err){
    console.log("Error uploading file to IPFS: ", err);
    throw err;
  }
}

export const uploadBuffer = async (buffer, filename) => {
  try {
    const result = await ipfs.add({
      path: filename,
      content: buffer
    });
    console.log("IPFS buffer uploaded: ", result.path);
    return result.path;
  } catch (err) {
    console.log("Error uploading buffer to IPFS: ", err);
    throw err;
  }
}

export const uploadJSON = async (jsonObject) => {
  try {
    const result = await ipfs.add(JSON.stringify(jsonObject));
    console.log("IPFS JSON uploaded: ", result.path);
    return result.path;
  } catch (err) {
    console.log("Error uploading JSON to IPFS: ", err);
    throw err;
  }
}

const ipfsService = {
  uploadFile,
  uploadBuffer,
  uploadJSON
};

export default ipfsService;
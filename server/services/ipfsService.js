const {create} = require("ipfs-http-client");


const projectId = process.env.INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
})

module.exports.uploadFile = async (fileBuffer) => {
  try{
    const result =await ipfs.add(fileBuffer);
    console.log("IPFS file uploaded: ", result.path);
    return result.path; //this is the hash
  }catch(err){
    console.log("Error uploading file to IPFS: ", err);
    throw err;
  }
}
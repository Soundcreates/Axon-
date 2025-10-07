import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,

});

const uploadFile = async (file) => {
  console.log("Jwt starts with: ", process.env.PINATA_JWT?.slice(0,20));
  console.log("The file that has come to the IPFS service is:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    hasBuffer: !!file.buffer,
    bufferLength: file.buffer ? file.buffer.length : 'No buffer'
  });

  try {
    // Validate buffer exists
    if (!file.buffer) {
      throw new Error("File buffer is missing!");
    }

    if (file.buffer.length === 0) {
      throw new Error("File buffer is empty!");
    }

    console.log("Creating File object for Pinata...");

    //  Create a proper File object for Pinata (not a stream)
    const fileBlob = new Blob([file.buffer], { type: file.mimetype });
    const fileToUpload = new File([fileBlob], file.originalname, { 
      type: file.mimetype 
    });

    console.log("Uploading to Pinata...");

    //make sure to add public in between pinata.upload.(public).file
    const result = await pinata.upload.public.file(fileToUpload, {
      metadata: {
        name: file.originalname || 'manuscript',
      }
    });

    console.log("File uploaded to IPFS using Pinata:", result);

    // Return object instead of using res.status()
    return {
      success: true,
      ipfsHash: result.cid,
      pinataUrl: `${process.env.PINATA_GATEWAY}/ipfs/${result.cid}`,
      fileSize: result.PinSize,
      timestamp: result.Timestamp
    };

  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw {
      success: false,
      error: error.message
    };
  }
};

const fetchDocument = async (contentHash) => {
  try {
    console.log("Fetching document from IPFS with hash:", contentHash);
    
    // Construct Pinata gateway URL
    const pinataGateway = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";
    const documentUrl = `${pinataGateway}/ipfs/${contentHash}`;
    
    console.log("Document URL:", documentUrl);
    
    // Test if the document is accessible
    const response = await fetch(documentUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log("Document is accessible");
      return {
        success: true,
        documentUrl: documentUrl,
        accessible: true,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      };
    } else {
      console.log("Document not accessible, status:", response.status);
      return {
        success: false,
        documentUrl: documentUrl,
        accessible: false,
        status: response.status,
        error: `Document not accessible: ${response.status}`
      };
    }
  } catch (error) {
    console.error("Error fetching document from IPFS:", error);
    return {
      success: false,
      accessible: false,
      error: error.message
    };
  }
};

export { uploadFile, fetchDocument };
export default uploadFile;
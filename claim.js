const { DocumentClient } = require("aws-sdk/clients/dynamodb");

const documentClient = new DocumentClient({
  region: process.env.region || "localhost",
  endpoint: process.env.endpoint || "http://localhost:8000",
});

exports.handler = async (event, context) => {
  const ownerId = await getOwnerIdFromToken(event.headers);

  //   handle inter-service dependency failure gracefully:
  if (!ownerId) {
    throw Error("Need owner id");
  }

  /* *** One google drive I saw had an endpoint that looked like it was baseUrl/transaction_id/transaction 
however, the google doc shows it as {baseUrl}/nft/{nftId}/claim/{claimToken} and as a GET.

I have two flows of execution below, one in which it is a post and you are getting nftId and claimToken from the 
request body.
And another where it is coming from the Path Parameters. 

I built it based off the google doc because I couldn't find the google sheet...

Just comment out/erase the one that is not needed:
*/

  //   if nftId and claimId is in POST body:
  //   if (!event.body) {
  //     return error(["Missing Event Body"]);
  //   }

  //   const payload = JSON.parse(event.body);
  //   if (!payload.nftId || payload.nftId === "") {
  //     return error(['The path parameter "nftId" is required.']);
  //   }

  //   if (!payload.claimToken || payload.claimToken === "") {
  //     return error(['The path parameter "claimToken" is required.']);
  //   }
  //   const nftId = payload.nftId;
  //   const claimToken = payload.claimToken;

  // If nftId and claimToken in path params:
  if (
    !event["pathParameters"]["nftId"] ||
    event["pathParameters"]["nftId"] === ""
  ) {
    return error(['The path parameter "nftId" is required.']);
  }

  if (
    !event["pathParameters"]["claimToken"] ||
    event["pathParameters"]["claimToken"] === ""
  ) {
    return error(['The path parameter "claimToken" is required.']);
  }

  const nftId = event["pathParameters"]["nftId"];
  const claimToken = event["pathParameters"]["claimToken"];

  try {
    const nft = await getNFTById(nftId);
    if (!nft) {
      return error(["Not Found"], 404);
    }

    await claimNFT(nft, ownerId);
    const successResponse = {
      message: "NFT claimed successfully",
      data: {
        nftId,
        claimToken,
      },
    };
    return success(successResponse);
  } catch (e) {
    console.log("Error: ", e);
    return error(["Internal Server Error"], 500);
  }
};

// responses:
function success(data, statusCode) {
  return {
    statusCode: statusCode || 200,
    body: JSON.stringify(data),
  };
}

function error(errorMessages, statusCode) {
  const response = {
    errors: errorMessages,
  };

  return {
    statusCode: statusCode || 400,
    body: JSON.stringify(response),
  };
}

// getOwnerId
async function getOwnerIdFromToken(headers) {
  // implement some form of OAuth to get ownerId from bearer token:
  return "ownerId";
}

// DAO:
async function getNFTById(nftId) {
  const params = {
    TableName: process.env.TableName || "NFTS",
    KeyConditionExpression: "nftId = :nftId",
    ExpressionAttributeValues: {
      ":nftId": nftId,
    },
  };

  const nft = await documentClient.query(params).promise();
  return nft?.Items.length ? nft.Items[0] : null;
}

async function claimNFT(nft, ownerId) {
  const Item = { ...nft, ownerId };
  const params = {
    TableName: process.env.TableName || "NFTS",
    Item,
  };

  await documentClient.put(params).promise();
}

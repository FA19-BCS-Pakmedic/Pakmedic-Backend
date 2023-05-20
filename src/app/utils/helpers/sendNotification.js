const fetch = require('node-fetch');

const sendNotification = async (title, body, user, navigate, data, image, tokenId) => {

    const notificationObj = {
        title: title || "",
        body: body || ``,
        user: user || "",
        navigate: navigate || "",
        data: data || null,
        image: image || null,
        tokenID: tokenId || "",
      }
      
      await fetch(`http://localhost:8000/api/v1/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationObj),
      });
}

module.exports = sendNotification;
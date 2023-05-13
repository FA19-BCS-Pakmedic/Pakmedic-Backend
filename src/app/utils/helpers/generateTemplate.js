const fs = require("fs");
const path = require("path");

const 
  reportTemplate
= (data) => {
  console.log(data.reports);

  // load image from local storage
  const image = getLogo();

  return `
<html lang="en">
  <head>
    <style>
      
        p{
            margin: 0;
            padding: 0;
        }
    
    body {
        font-family: Arial, Helvetica, sans-serif;
      }


      .root {
        max-width: 800px;
        margin: 2rem auto;
        padding: 20px;
        border: 10px solid #00cdb0;
        border-radius: 2rem;
        color: #003762;
      }

      .header {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .header > img {
        width: 100px;
        height: 100px;
      }

      .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        width: 100%;
      }

      .user_info_container {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        width: 100%;
      }

      .user_info {
        display: flex;
        margin-bottom: 1rem;
      }

      .label {
        font-weight: bold;
        font-size: 1.2rem;
        width: 70px;
      }

      .value {
        font-size: 1.2rem;
      }

      .report_info_container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        width: 100%;
      }

      .report_col_titles {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        width: 100%;
      }

      .title {
        font-weight: bold;
        font-size: 1.2rem;
        width: 25%;
        text-align: center;
        border: 1px solid #ccc;
      }

      .report_info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        width: 100%;
      }

      .report_value {
        width: 25%;
        text-align: center;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <div class="root">
      <div class="header">
        <img src=${`data:image/png;base64,${image}`} alt="logo" />
        <h1>Pakmedic</h1>
        <h2>${data.report}</h2>
      </div>

      <div class="container">
        <div class="user_info_container">
          <div class="user_info">
            <p class="label">Name:</p>
            <p class="value">${data.name}</p>
          </div>

          <div class="user_info">
            <p class="label">Email:</p>
            <p class="value">${data.email}</p>
          </div>

          <div class="user_info">
            <p class="label">Date:</p>
            <p class="value">${data.date}</p>
          </div>
        </div>

        <div class="report_info_container">
          <div class="report_col_titles">
            <p class="title">Test</p>
            <p class="title">Reference Range</p>
            <p class="title">Unit</p>
            <p class="title">Result</p>
          </div>
          ${
            data.reports &&
            data.reports.map((item) => {
              return `<div class="report_info">
                  <p class="report_value">${item[0].trim()}</p>
                  <p class="report_value">${item[1].trim()}</p>
                  <p class="report_value">${item[2].trim()}</p>
                  <p class="report_value">${item[3].trim()}</p>
                </div>`;
            })
          }
        </div>
      </div>
    </div>
  </body>
</html>

    `;
};




const prescriptionTemplate = (data) => {
  console.log(data);


  const image = getLogo();


  return `
<html lang="en">
  <head>
    <style>
      
        p{
            margin: 0;
            padding: 0;
        }
    
    body {
        font-family: Arial, Helvetica, sans-serif;
      }


      .root {
        max-width: 800px;
        margin: 2rem auto;
        padding: 20px;
        border: 10px solid #00cdb0;
        border-radius: 2rem;
        color: #003762;
      }

      .header {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .header > img {
        width: 100px;
        height: 100px;
      }

      .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        width: 100%;
      }

      .user_info_container {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        width: 100%;
      }

      .user_info {
        display: flex;
        margin-bottom: 1rem;
      }

      .label {
        font-weight: bold;
        font-size: 1.2rem;
        width: 70px;
      }

      .value {
        font-size: 1.2rem;
      }

      .report_info_container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        width: 100%;
      }

      .report_col_titles {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        width: 100%;
      }

      .title {
        font-weight: bold;
        font-size: 1.2rem;
        width: 25%;
        text-align: center;
        border: 1px solid #ccc;
      }

      .report_info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        width: 100%;
      }

      .report_value {
        width: 25%;
        text-align: center;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <div class="root">
      <div class="header">
        <img src=${`data:image/png;base64,${image}`} alt="logo" />
        <h1>Pakmedic</h1>

        <h2>Prescription</h2>
      </div>

      <div class="container">
        <div class="user_info_container">
          <div class="user_info">
            <p class="label">Name:</p>
            <p class="value">${data.name}</p>
          </div>

          <div class="user_info">
            <p class="label">Email:</p>
            <p class="value">${data.email}</p>
          </div>

          <div class="user_info">
            <p class="label">Date:</p>
            <p class="value">${data.date.toLocaleString()}</p>
          </div>
        </div>

        <div class="report_info_container">
          <div class="report_col_titles">
            <p class="title">Medicine</p>
            <p class="title">Dosage Form</p>
            <p class="title">Dosage Frequency</p>
            <p class="title">Days</p>
            <p class="title">Additional Days</p>
          </div>
          ${
            data.medicines &&
            data.medicines.map((item) => {
              return `<div class="report_info">
                  <p class="report_value">${item.name.trim()}</p>
                  <p class="report_value">${item.dosage_form.trim()}</p>
                  <p class="report_value">${item.dosage_frequency.trim()}</p>
                  <p class="report_value">${item.days}</p>
                  <p class="report_value">${item.additional_days}</p>
                </div>`;
            })
          }
        </div>
      </div>
    </div>
  </body>
</html>

    `;



}


const getLogo = () => {
  function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString("base64");
  }
  // load image from local storage
  const image = base64_encode(
    path.join(__dirname, "../../../public/images/logo.png")
  );

  return image;
}


module.exports = {
  reportTemplate,
  prescriptionTemplate
};

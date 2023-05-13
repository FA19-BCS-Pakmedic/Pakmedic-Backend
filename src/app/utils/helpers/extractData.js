const { uuid } = require("uuidv4");
const axios = require("axios");
const puppeteer = require("puppeteer");
const stream = require("stream");

const {reportTemplate, prescriptionTemplate} = require("../../utils/helpers/generateTemplate");
const gridfsFileStream = require("../../utils/helpers/gridfsFileStream");

exports.extractReportsData = async (data) => {
  const { lab_name, lab_type, file } = data;

  console.log(data);

  const response = await axios.post("http://localhost:5000/template", {
    lab_name,
    lab_type,
    file,
  });

  const filename = `${uuid().split("-")[0]}-${file}`;

  const html = reportTemplate({
    name: "Abdul Moeed",
    email: "test@gmail.com",
    date: new Date(),
    report: `${`${lab_type.toUpperCase()} TEST ${lab_name.toUpperCase()} LAB`}`,
    reports: response.data,
  });

  return {html, filename};

};


exports.extractPrescriptionData = async (data) => {

  const {file, ...reqData} = data;

  const filename = `${uuid().split("-")[0]}-${file}`;

  const html = prescriptionTemplate(reqData);


    return {html, filename};


}



exports.uploadToMongo = async (html, filename) => {

  console.log(filename);

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--explicitly-allowed-ports=" + 8000],
    });
    const page = await browser.newPage();
  
    await page.setContent(html);
  
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });
  
    await browser.close();
  
    const bucket = await gridfsFileStream();
  
    const metadata = {
      author: "John Doe",
      date: new Date(),
      description: "Example file for demonstration purposes",
    };
  
    const uploadStream = bucket.openUploadStream(filename, {
      metadata,
      contentType: "application/pdf",
    });
  
    const fileStream = stream.Readable.from(pdf);
  
    fileStream.pipe(uploadStream);
  
    uploadStream.on("finish", (_id) => {
      console.log(`File ${filename} has been uploaded to MongoDB`);
    });
  
    return filename;



  }catch(err) {
    console.log(err);
    return null
  }



}

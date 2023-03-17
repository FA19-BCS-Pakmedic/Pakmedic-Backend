import re
import PyPDF2



# creating a pdf file object
pdfFileObj = open('report.pdf', 'rb')


# creating a pdf reader object
pdfReader = PyPDF2.PdfReader(pdfFileObj)

# creating a page object
pageObj = pdfReader.pages[0]
  

# extracting text from page
# print(pageObj.extractText())

text = pageObj.extract_text().split('\n')


text_to_search = text[16]

text_to_search = "Hb 11.5  -  16 g/dl 8.8Total RBC 4  -  6 x10^12/l 3.8HCT 36  -  46 % 28MCV 75  -  95 fl 73MCH 26  -  32 pg 23MCHC 30  -  35 g/dl 32Platelet Count 150  -  400 x10^9/l 295WBC Count (TLC) 4  -  11 x10^9/l 6.6Neutrophils 40  -  75 % 56Lymphocytes 20  -  50 % 34Monocytes 02  -  10 % 08Eosinophils 01  -  06 % 02"

pattern = re.compile(r'([A-Za-z\(\)\s]+)+\s*([0-9]+[\.]?[0-9]?\s*\-\s*[0-9]+)\s*([g]{1}[\/]{1}dl{1}|[\%]{1}|[x|\*]{1}10{1}[\^]{1}[1-9]+[\/]{1}l{1}|fl{1}|pg{1})\s*([0-9]+[\.]?[0-9]?)+')

matches = pattern.findall(text_to_search)

print(matches)

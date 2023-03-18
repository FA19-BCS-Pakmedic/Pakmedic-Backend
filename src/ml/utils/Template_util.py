import re
import PyPDF2
from io import BytesIO


def get_data(file, lab_name, lab_type):
    # creating a pdf reader object
    pdfReader = PyPDF2.PdfReader(BytesIO(file))

            # creating a page object
    pageObj = pdfReader.pages[0]




    if(lab_name == "shaukat"):
        if(lab_type == "blood"):
            return blood_shaukat(pageObj)
        elif(lab_type == "liver"):
            return liver_shaukat(pageObj)
    elif(lab_name == "chughtai"):
        if(lab_type == "blood"):
            return blood_chughtai(pageObj)
        elif(lab_type == "liver"):
            return liver_chughtai(pageObj)



def blood_chughtai(pageObj):

    # extracting text from page
    text = pageObj.extract_text().split('\n')

    print(text)

    text_to_search = text[16]

    text_to_search = "Hb 11.5  -  16 g/dl 8.8Total RBC 4  -  6 x10^12/l 3.8HCT 36  -  46 % 28MCV 75  -  95 fl 73MCH 26  -  32 pg 23MCHC 30  -  35 g/dl 32Platelet Count 150  -  400 x10^9/l 295WBC Count (TLC) 4  -  11 x10^9/l 6.6Neutrophils 40  -  75 % 56Lymphocytes 20  -  50 % 34Monocytes 02  -  10 % 08Eosinophils 01  -  06 % 02"

    pattern = re.compile(r'([A-Za-z\(\)\s]+)+\s*([0-9]+[\.]?[0-9]?\s*\-\s*[0-9]+)\s*([g]{1}[\/]{1}dl{1}|[\%]{1}|[x|\*]{1}10{1}[\^]{1}[1-9]+[\/]{1}l{1}|fl{1}|pg{1})\s*([0-9]+[\.]?[0-9]?)+')

    matches = pattern.findall(text_to_search)

    print(matches)

    arrays_list = [list(t) for t in matches]

    return arrays_list

def liver_shaukat(pageObj):
    data = re.split('CBC|Chemistry \- I|TEST\(s\)|NORMAL\s[0-9]+\-[A-Z]+\-[0-9]+\s\n[0-9]+\:[0-9]+\:[0-9]+|UNIT\(s\)[A-Z]+\-[0-9]+\-[0-9]+|UNIT\(s\)[A-Z0-9]+|[A-Z0-9]{3}\-[A-Z0-9]+\sMRNO\s\:', pageObj.extract_text())    

    Tests = data[1].split("\n")
    Normal = data[2].split("\n");
    Units = data[3].split("\n");
    Results = data[4].split("\n");

    data = []
    for i in range (len(Tests)-1):
        data.append([Tests[i], Normal[i] if Normal[i] else "", Units[i] if Units[i] else "", Results[i]])
    
    return data

def liver_chughtai(pageObj):
    # cleaning the data
    data = pageObj.extract_text().split("UNIT")[1]

    data = data.replace("Less Than", "<")
    data = data.replace("More Than", ">")
    data = data.replace("\n", " ")

    # creating a pattern
    pattern = re.compile(r'([a-zA-Z\.\(\)\s]+)\s*([\<]?\s*[0-9]+\.?[0-9]?|[0-9]+\.?[0-9]?\s*\-\s*[0-9]+\.?[0-9]?)\s*(mg{1}\/{1}dl{1}|g{1}\/{1}dl{1}|U{1}\/{1}L{1})\s*([0-9]+\.?[0-9]?)')

    matches = pattern.findall(data)

    arrays_list = [list(t) for t in matches]


    return arrays_list


def blood_shaukat(pageObj):

    data = re.split('CBC|TEST\(s\)|NORMAL\s[0-9]+\-[A-Z]+\-[0-9]+\s\n[0-9]+\:[0-9]+\:[0-9]+|UNIT\(s\)[A-Z]+\-[0-9]+\-[0-9]+|[A-Z0-9]{3}\-[A-Z0-9]+\sMRNO\s\:', pageObj.extract_text())

    Tests = data[1].split("\n")
    Normal = data[2].split("\n")
    Units = data[3].split("\n")
    Results = data[4].split("\n")

    data = []
    for i in range (1, len(Tests)):
        data.append([Tests[i], Normal[i], Units[i], Results[i]])


    return data
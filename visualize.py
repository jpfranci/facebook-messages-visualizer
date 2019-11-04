import json
import sys
import nltk
from nltk.corpus import stopwords
from nltk.util import bigrams

def writeToFrequencyFile(mostFrequent, frequency_file_name, participants):
    try:
        file = open(frequency_file_name + ".csv", "wb")
        headers = "word,total,"
        for participant in participants:
            headers += participant["name"] + ","
        headers += "\n"
        file.write(headers.encode("utf-8"))
        
        body = ""
        for mostUsedWord in mostFrequent:
            body += mostUsedWord[0] + ","
            body += str(mostUsedWord[1]["total"]) + ","
            for participant in participants:
                if (participant["name"] in mostUsedWord[1]):
                    body += str(mostUsedWord[1][participant["name"]]) + ","
                else:
                    body += "0,"
            body += "\n"
        file.write(body.encode("utf-8"))
        file.close()
    except Exception as e:
        print("An error occured while opening or writing to file: " + frequency_file_name)
        print(str(e))

def writeToSenderFrequencyFile(senders, sender_file_name):
    try:
        file2 = open(sender_file_name + ".csv", "wb")
        for sender in list(senders.items()):
            file2.write((sender[0] + "," + str(sender[1]) + "\n").encode("utf-8"))
        file2.close()
    except Exception as e: 
        print("An error occured while opening or writing to file: " + sender_file_name)
        print(str(e))

def writeToFiles(mostFrequent, senders, participants, frequency_file_name, sender_file_name):
    writeToFrequencyFile(mostFrequent, frequency_file_name, participants)
    writeToSenderFrequencyFile(senders, sender_file_name)

    """
    keys = map(lambda mostUsed: mostUsed[0], mostUsed)
    values = map(lambda mostUsed: mostUsed[1], mostUsed)

    model = {"keys": list(keys), "values": list(values)}
    
    df = pd.Dataframe(model)
    ax = df.plot.bar(x = "keys", y = "values", rot = 0)
    """

def insertIntoMostFrequent(mostFrequent, message, word):
    if (word in mostFrequent):
        mostFrequent[word]["total"] = mostFrequent[word]["total"] + 1
        if (message["sender_name"] in mostFrequent[word]):
            mostFrequent[word][message["sender_name"]] = mostFrequent[word][message["sender_name"]] + 1
        else:
            mostFrequent[word][message["sender_name"]] = 1
    else:
        mostFrequent[word] = {"total": 1, message["sender_name"]: 1}



def populateFrequencyDicts(data, mostFrequent, senders):
    stopWords = set(stopwords.words('english'))
    for message in data["messages"]:
        sender = message.get("sender_name", "")
        if (sender in senders):
            senders[sender] = senders[sender] + 1
        else:
            senders[sender] = 1
        messageContents = message.get("content", "")
        wordsInMessage = messageContents.split()
        wordsInMessage = list(filter(lambda word: word.lower() not in stopWords, wordsInMessage))
        bigramsList = list(map(lambda bigram: bigram[0].lower() + " " + bigram[1].lower(), bigrams(wordsInMessage)))
        
        for word in wordsInMessage:
            word = word.lower()
            insertIntoMostFrequent(mostFrequent, message, word)
        
        for bigram in bigramsList:
            insertIntoMostFrequent(mostFrequent, message, bigram)
           

def getMostUsed(mostFrequent, start, end):
    wordFrequencyList = list(mostFrequent.items())
    wordFrequencyList.sort(key = lambda mostFrequent: mostFrequent[1]["total"], reverse = True)
    return wordFrequencyList[int(start):int(end)]

def processFiles(data, start, end, frequency_file_name, sender_file_name):
    mostFrequent = {}
    senders = {}

    try: 
        populateFrequencyDicts(data, mostFrequent, senders)
        mostUsed = getMostUsed(mostFrequent, start, end)
        writeToFiles(mostUsed, senders, data["participants"], frequency_file_name, sender_file_name)
    except Exception as e: 
        print("An error occured while extracting data from the file, make sure you are using the right file provided by facebook in json format")
        print(str(e))

def main():     
    if (len(sys.argv) == 4 or len(sys.argv) == 6): 
        start = 0
        end = 1000
        if (len(sys.argv) == 6):
            start = sys.argv[4]
            end = sys.argv[5]
        try:
            file = open(sys.argv[1])
            data = json.load(file)
            file.close()
            processFiles(data, start, end, sys.argv[2], sys.argv[3])
            print("finished")
        except Exception as e:
            print("Something went wrong while opening " + sys.argv[1])
    else:
        print("Invalid argument list. Script should be called with py visualize.py [input_file] [frequency_file_name] [sender_file_name] OPTIONAL[start] OPTIONAL[end]")

if __name__ == "__main__":
    main()
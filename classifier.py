import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from nltk.tokenize import word_tokenize
import sys
from textblob import TextBlob
import string



def Datacleaning(data): 
    sent=str.lower(str(data))
    txt=sent.strip()
    w=txt.translate(str.maketrans('','',string.punctuation)) 
    return w

def getScore(text):
    data=Datacleaning(text)
    return TextBlob(data).sentiment.polarity

def getSentiment(score):
    if(score<=-0.5):
        return 1
    elif(score>-0.5 and score<0):
        return 2
    elif(score==0):
        return 3
    elif(score>0 and score<=0.5):
        return 4
    else:
        return 5

def Analyze(text):
    y=getScore(text)
    print(getSentiment(y))



Analyze([sys.argv[1]])









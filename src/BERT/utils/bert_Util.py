import matplotlib.pyplot as plt
import pandas as pd
import tensorflow as tf
import numpy as np
import nltk  as nlt
from transformers import *



def get_span_from_scores(start_scores, end_scores, input_mask, verbose=False):
    """
    Find start and end indices that maximize sum of start score
    and end score, subject to the constraint that start is before end
    and both are valid according to input_mask.

    Args:
        start_scores (list): contains scores for start positions, shape (1, n)
        end_scores (list): constains scores for end positions, shape (1, n)
        input_mask (list): 1 for valid positions and 0 otherwise
    """
    n = len(start_scores)
    max_start_i = -1
    max_end_j = -1
    max_start_score = -np.inf
    max_end_score = -np.inf
    max_sum = -np.inf
    
    # Find i and j that maximizes start_scores[i] + start_scores[j]
    # so that i <= j and input_mask[i] == input_mask[j] == 1
    
    ### START CODE HERE (REPLACE INSTANCES OF 'None' with your code) ###
    # set the range for i
    for i in range(len(start_scores)): # complete this line
        
        # set the range for j
        for j in range(i, len(start_scores)): #complete this line

            # both input masks should be 1
            if (input_mask[i] == 1) & (input_mask[j] == 1): # complete this line
                
                # check if the sum of the start and end scores is greater than the previous max sum
                if start_scores[i] + end_scores[j] > max_sum: # complete this line

                    # calculate the new max sum
                    max_sum = start_scores[i] + end_scores[j]
        
                    # save the index of the max start score
                    max_start_i = i
                
                    # save the index for the max end score
                    max_end_j = j
                    
                    # save the value of the max start score
                    max_start_val = start_scores[i]
                    
                    # save the value of the max end score
                    max_end_val = end_scores[j]
                                        
    ### END CODE HERE ###
    if verbose:
        print(f"max start is at index i={max_start_i} and score {max_start_val}")
        print(f"max end is at index i={max_end_j} and score {max_end_val}")
        print(f"max start + max end sum of scores is {max_sum}")
    return max_start_i, max_end_j

def prepare_bert_input(question, passage, tokenizer, max_seq_length=384):
    """
    Prepare question and passage for input to BERT. 

    Args:
        question (string): question string
        passage (string): passage string where answer should lie
        tokenizer (Tokenizer): used for transforming raw string input
        max_seq_length (int): length of BERT input
    
    Returns:
        input_ids (tf.Tensor): tensor of size (1, max_seq_length) which holds
                               ids of tokens in input
        input_mask (list): list of length max_seq_length of 1s and 0s with 1s
                           in indices corresponding to input tokens, 0s in
                           indices corresponding to padding
        tokens (list): list of length of actual string tokens corresponding to input_ids
    """
    # tokenize question
    question_tokens = tokenizer.tokenize(question)
    
    # tokenize passage
    passage_token = tokenizer.tokenize(passage)

    # get special tokens 
    CLS = tokenizer.cls_token
    SEP = tokenizer.sep_token
    
    ### START CODE HERE (REPLACE INSTANCES OF 'None' with your code) ###
    
    # manipulate tokens to get input in correct form (not adding padding yet)
    # CLS {question_tokens} SEP {answer_tokens} 
    # This should be a list of tokens
    tokens = []
    tokens.append(CLS)
    tokens.extend(question_tokens)
    tokens.append(SEP)
    tokens.extend(passage_token)

    
    # Convert tokens into integer IDs.
    input_ids = tokenizer.convert_tokens_to_ids(tokens)
    
    # Create an input mask which has integer 1 for each token in the 'tokens' list
    input_mask = [1]*len(input_ids)

    # pad input_ids with 0s until it is the max_seq_length
    # Create padding for input_ids by creating a list of zeros [0,0,...0]
    # Add the padding to input_ids so that its length equals max_seq_length
    input_ids += [0]*(max_seq_length - len(input_ids))
    
    # Do the same to pad the input_mask so its length is max_seq_length
    input_mask += [0]*(max_seq_length - len(input_mask))

    # END CODE HERE

    return tf.expand_dims(tf.convert_to_tensor(input_ids), 0), input_mask, tokens

def construct_answer(tokens):
    """
    Combine tokens into a string, remove some hash symbols, and leading/trailing whitespace.
    Args:
        tokens: a list of tokens (strings)
    
    Returns:
        out_string: the processed string.
    """
    
    ### START CODE HERE (REPLACE INSTANCES OF 'None' with your code) ###
    
    # join the tokens together with whitespace
    out_string = ' '.join(tokens)
    
    # replace ' ##' with empty string
    out_string = out_string.replace(' ##', '')
    
    # remove leading and trailing whitespace
    out_string = out_string.strip()

    ### END CODE HERE ###
    
    # if there is an '@' symbol in the tokens, remove all whitespace
    if '@' in tokens:
        out_string = out_string.replace(' ', '')

    return out_string

def get_model_answer(model, question, passage, tokenizer, max_seq_length=384):
    """
    Identify answer in passage for a given question using BERT. 

    Args:
        model (Model): pretrained Bert model which we'll use to answer questions
        question (string): question string
        passage (string): passage string
        tokenizer (Tokenizer): used for preprocessing of input
        max_seq_length (int): length of input for model
        
    Returns:
        answer (string): answer to input question according to model
    """ 
    # prepare input: use the function prepare_bert_input
    input_ids, input_mask, tokens = prepare_bert_input(question, passage, tokenizer, max_seq_length)
    
    # get scores for start of answer and end of answer
    # use the model returned by TFAutoModelForQuestionAnswering.from_pretrained("./models")
    # pass in in the input ids that are returned by prepare_bert_input
    start_scores, end_scores = model(input_ids)
    
    # start_scores and end_scores will be tensors of shape [1,max_seq_length]
    # To pass these into get_span_from_scores function, 
    # take the value at index 0 to get a tensor of shape [max_seq_length]
    start_scores = start_scores[0]
    end_scores = end_scores[0]
    
    # using scores, get most likely answer
    # use the get_span_from_scores function
    span_start, span_end = get_span_from_scores(start_scores, end_scores, input_mask)
    
    # Using array indexing to get the tokens from the span start to span end (including the span_end)
    answer_tokens = tokens[span_start:span_end+1]
    
    # Combine the tokens into a single string and perform post-processing
    # use construct_answer
    answer = construct_answer(answer_tokens)
    
    return answer
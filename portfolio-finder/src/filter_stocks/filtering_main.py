import pandas as pd 
from tqdm import tqdm 
import numpy as np 
import yfinance as yf 
import os


def stock_filtering(horizon,risk,one_hot_vector): 

    ticker_class, index_class = get_stock_classes('1h','2024-10-20','2024-10-30',['Open','High','Low','Close','Volume','Dividends','Stock Splits' ],one_hot_vector)
    test_dict = [{'Symbol':'AAPL','Amount':123}]
    return test_dict


def sector_filtering(one_hot_vector):

    sectors = ['Information Technology','Health Care','Financials','Consumer Discretionary','Communication Services','Industrials','Consumer Staples','Energy','Utilities','Real Estate','Materials']
    selected_sectors = []
    for i in range(0,11):
        if one_hot_vector[i] == 1: 
            selected_sectors.append(sectors[i])

    companies_path = "./src/filter_stocks/sp500_companies.csv"

    with open(companies_path,'r') as spreadsheet: 
        df = pd.read_csv(spreadsheet)

    filtered_df = df[df.Sector.isin(selected_sectors)]

    return filtered_df 


# def calculate_beta(tickers_df): 
    
def get_yf_data(tickers,interval,start_data,end_date,values,mode='in_hours'):

    #tickers: list -> ex ['AAPL','GOOG']
    #interval: str -> one from 1m, 2m, 5m, 15m, 30m, 1h, 90m, 1d, 1wk
    #start_data: str ->  'YYYY-MM-DD' ex '2024-09-02'
    #end date: -> 'YYYY-MM-DD' ex '2024-09-05'
    #values: list -> any combintation of ['Open','High','Low','Close','Volume','Dividends','Stock Splits']

    #returns: dict of pandas dataframes -> {'AAPL':pd.Dataframe}

    stock_group = {}
    yf_vals = ['Open','High','Low','Close','Volume','Dividends','Stock Splits']
    drop_cols = [i for i in yf_vals if i not in values]
    start_data = pd.to_datetime(start_data).tz_localize('America/New_York')


    for name in tqdm(tickers,desc=f'Loading {len(tickers)} data',total=len(tickers)): 
        try:
            ticker = yf.Ticker(name.lower())
        except:
            print(f'######  Ticker {name} not a valid symbol  ######')
        try: 
            ticker_data = ticker.history(start=start_data,end=end_date,interval=interval)
        except: 
            print('######   Start time, end time or interval not a valid option   ######')
        ticker_data = ticker_data.drop(drop_cols,axis=1)
        stock_group[f'{name}'] = ticker_data 

    
    print(f'Loaded {len(tickers)} tickers at {interval} resolution from {start_data} to {end_date}')

    return stock_group  



def get_ticker_objects(tickers_df,interval,start_date,end_date,values): 

    symbols = list(tickers_df['Symbol'])
    stock_group = get_yf_data(symbols,interval,start_date,end_date,values)
    index = ['SPY']
    index_group = get_yf_data(index,interval,start_date,end_date,values)
    return stock_group,index_group


class Ticker_Attributes: 

    def __init__(self,ticker_dict):
        self.ticker_dict = ticker_dict 

    def get_attribute(self,attribute): 

        self.attribute = attribute 

        results = {}
        key_vals = self.ticker_dict.keys()
        for stock_name in key_vals: 
            print(stock_name)
            dataframe = self.ticker_dict[stock_name]
            extracted_vals = list(dataframe[self.attribute])
            results[stock_name] = extracted_vals 

        return results 
    

def get_stock_classes(interval,start_date,end_date,values,one_hot_vector):

    df = sector_filtering(one_hot_vector)
    stock_group, index_group = get_ticker_objects(df,interval,start_date,end_date,values)
    ticker_class = Ticker_Attributes(stock_group)
    index_class = Ticker_Attributes(index_group)

    return ticker_class,index_class 


def get_standard_deviation(values):

    denominator = len(values) -1
    values = np.array(values)
    test_std = np.std(values)
    return test_std

def calculate_covariance(set1,set2): 

    set1 = np.array(set1)
    set2 = np.array(set2)
    mean1 = np.mean(set1)
    mean2 = np.mean(set2)
    var1 = 0 
    var2 = 0 
    length = len(set1) 
    for i in range(0,length):
        var1 += (set1[i] - mean1)
        var2 += (set2[i] - mean2)
    covariance = (var1 * var2) / length 
    return covariance 








    


def maxiumum_drawdown(values):

    print()


test_dict = stock_filtering(2,3,[1,1,1,1,1,1,1,1,1,1,1])









    


            








# one_hot_vector = [1,1,1,1,1,1,1,1,1,1,1]
# file_path = '/Users/henry/Computer_Science/hackNC24/sp500_companies.csv'
# df = sector_filtering(one_hot_vector,file_path)
# stock_group,index_group = get_ticker_objects(df,'1h','2024-10-20','2024-10-31',['Open','High','Low','Close','Volume','Dividends','Stock Splits'])
# ticker_class = Ticker_Attributes(stock_group)
# index_class = Ticker_Attributes(index_group)
# volume_only = ticker_class.get_attribute('Volume')
# index_volume_only = index_class.get_attribute('Volume')
# print(volume_only['GOOG'])
# standard_deviation = get_standard_deviation(volume_only['GOOG'])
# print(standard_deviation)




















    






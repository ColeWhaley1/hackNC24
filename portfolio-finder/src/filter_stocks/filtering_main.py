import pandas as pd 
from tqdm import tqdm 
import numpy as np 
import yfinance as yf 
import os


def stock_filtering(horizon,risk,one_hot_vector): 

    if(not 1 in one_hot_vector):
        one_hot_vector = [1,1,1,1,1,1,1,1,1,1,1]

    ticker_class, index_class = get_stock_classes('1h','2024-10-20','2024-10-30',['Open','High','Low','Close','Volume','Dividends','Stock Splits' ],one_hot_vector)
    weights,tickers = value_filtering2(horizon,risk,one_hot_vector,'1d','2024-5-20','2024-10-31')
    portfolio = build_final_portfolio(weights,tickers,100)
    return portfolio 


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
    test_std = np.std(values,ddof=1)
    return test_std/np.mean(values)


def calculate_covariance(set1,set2): 

    set1 = np.array(set1)
    set2 = np.array(set2)
    try:
        test_covariance = np.cov(set1,set2)
        test_covariance = test_covariance[0,1]
        return test_covariance 
    except: 
        return 1

def get_beta(stock_set,index_set): 

    covariance = calculate_covariance(stock_set,index_set)
    index_variance = np.var(np.array(index_set))
    beta = covariance / index_variance 
    return np.abs(beta)


def get_maximum_drawdown(value_array):
    #should be used more for daily calculations and short term calculations 

    value_array = np.array(value_array)
    array_avg = np.mean(value_array)
    
    l = 0 
    r = 1 
    mdd = 0 


    while r < len(value_array) -1: 
        if value_array[r] >= value_array[l]:
            l = r 
        else: 
            mdd = min(mdd, value_array[r] - value_array[l])
        r+= 1 

    return np.abs(mdd/array_avg)


from scipy.optimize import minimize 
import itertools
from collections import OrderedDict 


def objective_function(weights,covariance,volatilities):
    #sigma = volatilities 
    #Sigma = covariance 
    weights = np.array(weights)
    numerator = np.sum(np.dot(weights,volatilities))
    temp = np.dot(covariance, weights)
    denominator = np.sqrt(np.dot(weights, temp))
    final_val = -1 *( numerator / denominator )
    return final_val


def constraint1(weights):
    return float(np.sum(weights,axis=0)-1)

def portfolio_sizing(values,stock_tickers):

    #needs to be passed in one specific value (most likely open or close)
    data = []
    volatilities = []
    for name in stock_tickers: 
        data.append(values[name])
        volatilities.append(get_standard_deviation(values[name]))

    data = np.array(data)
    covariance_matrix = np.cov(data)
    weight_val = float(f"{1 / len(stock_tickers):.5f}")
    weights = np.full((len(stock_tickers)),weight_val)

    bounds = [(0.01,0.4) for _ in weights]
    con1 = {'type':'eq','fun':constraint1}
    con2 = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1})
    cons = [con1]
    sol = minimize(objective_function,weights,args=(covariance_matrix,volatilities),
                   method = 'SLSQP',bounds=bounds,constraints=con2)
    
    optimal_weights = sol.x 

    return optimal_weights 

def mean_reversion(values):

    last_val = values[-1]
    mean = np.mean(np.array(values))
    difference = (mean - last_val) / mean 
    return difference



def value_filtering2(time_horizon,risk_tolerance,one_hot_vector,interval,start_date,end_date):

    new_df = pd.DataFrame(columns=['Symbol','Similarity'])

    
    profile = time_horizon * risk_tolerance 
    if profile <= 20:
        type = 1 
        type1_ideal = [.5,1.85,1.1]
    if profile >= 21 or profile <= 40:
        type_ideal = [.25,1.5,.9]
    if profile >= 41 or profile <= 60:
        type = 3 
        type_ideal = [.175,.112,.65]
    if profile >= 61 or profile <= 80:
        type = 4 
        type_ideal = [.12,.75,.35]
    if profile >= 81 or profile <= 100:
        type = 5 
        type_ideal = [.1,.25,.15]

    values = ['Open','High','Low','Close','Volume','Dividends','Stock Splits']

    ticker_class,index_class = get_stock_classes(interval,start_date,end_date,values,one_hot_vector)
    ticker_data = ticker_class.ticker_dict 
    keys = list(ticker_data.keys())
    index_data = index_class.get_attribute('Open')
    index_data = index_data['SPY']


    for i, val in enumerate(keys): 
        ticker_prices = ticker_class.get_attribute('Open')
        ticker_prices = ticker_prices[val]
        std = get_standard_deviation(ticker_prices)
        beta = get_beta(ticker_prices,index_data)
        md = get_maximum_drawdown(ticker_prices) 

        difference = np.square(std - type_ideal[0]) + np.square(beta - type_ideal[1]) + np.square(md - type_ideal[2])
        difference += 0.08 * (mean_reversion(ticker_prices))
        df_column = pd.DataFrame({'Symbol': [val],'Similarity':[difference]})
        new_df = pd.concat([new_df,df_column],ignore_index=True)


    new_df = new_df.sort_values(by=['Similarity'])
    final_df = new_df[:25]

    selected_tickers = final_df['Symbol']
    ticker_data = ticker_class.get_attribute('Open')
    optimal_weights = portfolio_sizing(ticker_data,selected_tickers)

    return optimal_weights, selected_tickers.values

def build_final_portfolio(optimal_weights,selected_ticker_vals,total_price):

    final_output = []
    for weight,val in zip(optimal_weights,selected_ticker_vals):
        row = {'Symbol':val,'Amount': f'{total_price * weight:.2f}'}
        final_output.append(row)

    return final_output 


# weights,tickers = value_filtering2(6,9,[0,4,1,1,1,1,1,1,1,1,1],'1d','2024-5-20','2024-10-31')
# print(weights)
# portfolio = build_final_portfolio(weights,tickers,100)
# print(portfolio)

#remove print statements before pasting over 
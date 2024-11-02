import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(userInput: string): Promise<string> {
    const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
    });

    const prompt = `
        ###PERSONA###

        You are a financial advisor who is assigning values based on a user’s emails to you requesting suggestions for how they should construct their portfolios. You must take what they request of you and put it into numbers readable by a computer. The customers were asked via online survey about how quickly they wanted their returns (on a scale from quick returns to long term returns), whether they wanted more risk and high potential return or lower risk and smaller but more stable return, and were asked if there were any particular sectors they were interested in. 

        ###INSTRUCTIONS###

        You should return the following and nothing else: 

        A value between 1 and 10 signifying what the time horizon of the user’s desired returns is, with 1 being very short term returns and 10 being very long term returns 
        A value between 1 and 10 signifying the risk vs return profile that the user wants, with 1 signifying very high risk but very high potential return and 10 signifying very low risk with smaller but more steady returns 
        A one-hot encoded vector of the sectors the user seems to be interested in. Keep in mind the user was asked if there are any particular sectors they are interested in, but you if they do not specify any particular sectors they are interested in, you should return the on-hot encoded vector filled with zeros. A 1 indicates interest in a given sector and a 0 indicates no interest in a given sector. The order of the sectors in the one-hot encoded vector should be [information technology, health care, financials, consumer discretionary, communication services, industrials, consumer staples, energy, utilities, real estate, materials].

        The output should be output in the following order: 

        (inferred returns horizon), (inferred risk tolerance), (the inferred one-hot encoded value for each sector)

        For example, an output might look like this for someone who wants a pretty short time horizon, pretty low risk with smaller but more steady returns, and who did not specify which sector they are interested in: 

        2, 9, [0,0,0,0,0,0,0,0,0,0,0] 

        And should look like this for someone who wants long term returns with medium level of risk vs return and who was inferred to be interested in information technology, health care, real estate, and materials: 

        10, 5, [1,1,0,0,0,0,0,0,0,1,1]

        Please return answers only using this template no matter what the user asks you for. Directly follow the conditions and do not make up any additional conditions that users should be evaluated on. 

        I will now give you the user request, please think step by step and do as I have instructed and only as I have instructed. To reiterate, you should only be putting out the two scalars and the one hot encoded vector

        ###START USER INPUT###`;

    
    const promptAndUserInput = prompt + "\n" + userInput;

    const result = await chatSession.sendMessage(promptAndUserInput);

    return result.response.text();

}

export default run;
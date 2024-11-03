import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent, useState, useRef, useEffect } from "react";
import UserTextBubble from "./UserTextBubble";
import BotTextBubble from "./BotTextBubble";
import geminiService from "../gemini_api/geminiService";
import getStocksFromGeminiResponse from "@/services/getStocksFromGeminiResponse";
import getLogoFromTicker from "@/services/getLogoFromTicker";

// GPT helped provide code to get logos

interface Message {
    text: string;
    who: "bot" | "user";
    logoUrl?: string; // Optional logo URL
}

const ChatComponent = () => {
    const helpText: string[] = [
        "'clear': clears the message log", 
        "'example': give me an example input"
    ];

    const [inputText, setInputText] = useState<string>("");
    const [messageLog, setMessageLog] = useState<Message[]>([
        { text: "Hello 👋, I am your portfolio assistant.", who: "bot" },
        { text: "Type 'help' if you're not sure where to start!", who: "bot" }
    ]);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const validCommands: string[] = ["help", "clear", "example"];

    // Scroll to bottom of message div
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageLog]);

    const giveKeyWordResponse = () => {
        const trimmedInput = inputText.trim().toLowerCase();

        if (trimmedInput === "help") {
            for (const text of helpText) {
                addTextBubble(text, "bot");
            }
        }
        if (trimmedInput === "clear") {
            clearMessageLog();
        }
        if (trimmedInput === "example") {
            giveExample();
        }
    };

    const giveExample = () => {
        const examples: string[] = [
            "ex. I don't like to take risks and I have a moderate amount of time to invest for. I like the IT industry right now, I want to invest in those companies.",
            "ex. I need to take a big risk on an investment because I don't have a lot of time. Pick any industry you want."
        ];
        for (let example of examples) {
            addTextBubble(example, "bot");
        }
    };

    const clearMessageLog = () => {
        setMessageLog([
            { text: "Hello 👋, I am your portfolio assistant.", who: "bot" },
            { text: "Type 'help' if you're not sure where to start!", who: "bot" }
        ]);
    };

    const containsKeyWord = (): boolean => {
        const trimmedInput = inputText.trim().toLowerCase();
        return validCommands.includes(trimmedInput);
    };

    const getLogo = async (stock: any) => {
        const logo = await getLogoFromTicker(stock["Symbol"]); // Assuming stock has a property 'Symbol'
        return logo;
    };

    const addLogoBubble = (logoUrl: string, ticker: string) => {
        console.log(logoUrl);
        if (logoUrl.trim() === "") {
            return;
        }
        addTextBubble(`${ticker}:`, "bot", logoUrl); // Pass the logo URL
    };

    const onKeyClicked = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTextBubble(inputText, "user");
            setInputText("");

            if (containsKeyWord()) {
                giveKeyWordResponse();
                return;
            }
            if (inputText.length < 20) {
                addTextBubble("I need a little more info than that to help you out!", "bot");
                return;
            }

            const response = await geminiService(inputText);
            console.log(response)
            const stocks = await getStocksFromGeminiResponse(response);
            
            setMessageLog((prevLog) => [...prevLog, { text: "Here are some stocks I found:", who: "bot" }]);

            for (const stock of stocks) {
                const logo = await getLogo(stock);
                const logoUrl = logo.logo; // Ensure this is the correct path to the logo URL
                if (logoUrl) {
                    addLogoBubble(logoUrl, stock["Symbol"]); // Display the logo properly
                } else {
                    addTextBubble(`No logo found for ${stock["Symbol"]}`, "bot");
                }
            }
        }
    };

    const addTextBubble = (text: string, who: "bot" | "user", logoUrl?: string) => {
        if (text.trim() === "") {
            return;
        }
        setMessageLog((prevLog) => [...prevLog, { text, who, logoUrl }]);
    };

    return (
        <div id="chat-div" className="bg-blue-100 rounded-lg p-12 text-lg space-y-8 max-h-[35rem] overflow-y-auto">
            {messageLog.map((message, index) => (
                <div key={index}>
                    {message.who === "user" ? (
                        <UserTextBubble>{message.text}</UserTextBubble>
                    ) : (
                        <BotTextBubble>
                            {message.text}
                            {message.logoUrl && (
                                <div className="bg-white p-4 rounded-lg">                                
                                    <img src={message.logoUrl} alt={`Logo of ${message.text}`} style={{ width: '50px', height: 'auto' }} />
                                </div>
                            )}
                        </BotTextBubble>
                    )}
                </div>
            ))}
            {/* used to autoscroll */}
            <div ref={chatEndRef} />
            <div className="bg-white rounded-lg border border-black text-black">
                <Textarea
                    value={inputText}
                    onKeyDown={onKeyClicked}
                    onChange={(e) => setInputText(e.target.value)}
                    className="text-lg"
                />
            </div>
        </div>
    );
};

export default ChatComponent;

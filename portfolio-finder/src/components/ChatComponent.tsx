import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent, useState, useRef, useEffect } from "react";
import UserTextBubble from "./UserTextBubble";
import BotTextBubble from "./BotTextBubble";
import geminiService from "../gemini_api/geminiService";
import getStocksFromGeminiResponse from "@/services/getStocksFromGeminiResponse";

// chatgpt used to create auto-scroll to bottom of chat div

interface Message {
    text: string;
    who: "bot" | "user";
}

const ChatComponent = () => {
    const helpText: string = `
        'clear': clears the message log 
        'example': give me an example input
    `;

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
            addTextBubble(helpText, "bot");
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
        for(let example of examples){
            addTextBubble(example, "bot")
        }
    }

    const clearMessageLog = () => {
        setMessageLog([
            { text: "Hello 👋, I am your portfolio assistant.", who: "bot" },
            { text: "Type 'help' if you're not sure where to start!", who: "bot" }
        ]);
    }

    const containsKeyWord = (): boolean => {
        const trimmedInput = inputText.trim().toLowerCase();
        return validCommands.includes(trimmedInput);
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
            if(inputText.length < 20) {
                addTextBubble("I need a little more info than that to help you out!", "bot");
                return;
            }

            const response = await geminiService(inputText);

            const stocks = getStocksFromGeminiResponse(response);
            
            addTextBubble(response, "bot");
        }
    };

    const addTextBubble = (text: string, who: "bot" | "user") => {
        if (text.trim() === "") {
            return;
        }
        setMessageLog((prevLog) => [...prevLog, { text, who }]);
    };

    return (
        <div id="chat-div" className="bg-blue-100 rounded-lg p-12 text-lg space-y-8 max-h-[35rem] overflow-y-auto">
            {messageLog.map((message, index) =>
                message.who === "user" ? (
                    <UserTextBubble key={index}>{message.text}</UserTextBubble>
                ) : (
                    <BotTextBubble key={index}>{message.text}</BotTextBubble>
                )
            )}
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



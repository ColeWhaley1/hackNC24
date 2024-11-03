import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent, useState, useRef, useEffect, ReactNode } from "react";
import UserTextBubble from "./UserTextBubble";
import BotTextBubble from "./BotTextBubble";
import geminiService from "@/api/geminiService";
import {Advice} from "./ui/Advice.tsx"
import {Help} from "./ui/Advice.tsx"


// chatgpt used to create auto-scroll to bottom of chat div

interface Message {
    text: ReactNode;
    who: "bot" | "user";
}


const ChatComponent = () => {
    const adviceText=()=><Advice/>;
    const helpText=()=><Help/>;

    const [inputText, setInputText] = useState<string>("");
    const [messageLog, setMessageLog] = useState<Message[]>([
        { text: "Hello 👋, I am your portfolio assistant.", who: "bot" },
        { text: "Type 'Help' if you're not sure where to start!", who: "bot" }
    ]);

    const chatEndRef = useRef<HTMLDivElement>(null);  // Ref for the end of the chat container
    const validCommands: string[] = ["help", "clear","advice"];

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageLog]);

    const giveKeyWordResponse = () => {
        const trimmedInput = inputText.trim().toLowerCase();
        if (trimmedInput === "advice") {
            addTextBubble(adviceText(), "bot");
        }
        if (trimmedInput==="help"){
            addTextBubble(helpText(),"bot")
        }
        if (trimmedInput === "clear") {
            clearMessageLog();
        }
    };

    const clearMessageLog = () => {
        setMessageLog([
            { text: "Hello 👋, I am your portfolio assistant.", who: "bot" },
            { text: "Type 'Help' if you're not sure where to start!", who: "bot" }
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

            const response = await geminiService(inputText);
            addTextBubble(response, "bot");
        }
    };

    const addTextBubble = (text: ReactNode, who: "bot" | "user") => {
        if (typeof text==="string"&&text.trim() === "") {
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

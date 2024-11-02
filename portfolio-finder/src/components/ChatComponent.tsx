import { Textarea } from "@/components/ui/textarea"
import { KeyboardEvent, useState } from "react";
import UserTextBubble from "./UserTextBubble";
import BotTextBubble from "./BotTextBubble";
import geminiService from "@/api/geminiService";

interface message {
    text: string,
    who: "bot" | "user";
}

const ChatComponent = () => {

    const helpText: string = `
        Help Text
    `;

    const [inputText, setInputText] = useState<string>('');

    const [messageLog, setMessageLog] = useState<message[]>([
        {
            text: "Hello 👋, I am your portfolio assistant.",
            who: "bot"
        },
        {
            text: "Type 'help' if you're not sure where to start!",
            who: "bot"
        }
    ]);

    const checkForKeyWord = () => {
        const trimmedInput = inputText.trim();
        if(trimmedInput === "help"){
            addTextBubble(helpText, "bot");
        }
    }

    const onKeyClicked = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if(event.key === "Enter"){

            event.preventDefault();
            addTextBubble(inputText, "user");
            setInputText('');

            checkForKeyWord();

            const response = await geminiService(inputText);
            console.log(response);

            addTextBubble(response, "bot");
        }
    }
    
    const addTextBubble = (text: string, who: "bot" | "user") => {
        if(inputText.trim() === ''){
            return;
        }
        console.log("push message")
        messageLog.push({
            text,
            who
        });
    }

    return (
        <div id="chat-div" className="bg-blue-100 rounded-lg p-12 text-lg space-y-8 overflow-y-auto">
            {messageLog.map((message, index) => (
                message.who === 'user' ? (
                    <UserTextBubble key={index}>
                        {message.text}
                    </UserTextBubble>
                ) : (
                    <BotTextBubble key={index}>
                        {message.text}
                    </BotTextBubble>
                )
            ))}
            <div className="bg-white rounded-lg border border-black text-black">
                <Textarea value={inputText} onKeyDown={onKeyClicked} onChange={(e) => setInputText(e.target.value)} className="text-lg"/>
            </div>
        </div>
    )
}

export default ChatComponent;
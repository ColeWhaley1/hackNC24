import { Textarea } from "@/components/ui/textarea"
import { KeyboardEvent, useState } from "react";
import UserTextBubble from "./UserTextBubble";
import BotTextBubble from "./BotTextBubble";

interface message {
    text: string,
    who: "bot" | "user";
}

const ChatComponent = () => {

    const [inputText, setInputText] = useState<string>('');

    const [messageLog, setMessageLog] = useState<message[]>([
        {
            text: "Hello 👋, I am your portfolio assistant.",
            who: "bot"
        }
    ]);

    const onKeyClicked = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if(event.key === "Enter"){
            event.preventDefault();
            addTextBubble(inputText, "user");
            setInputText('');
        }
    }
    
    const addTextBubble = (text: string, who: "bot" | "user") => {
        messageLog.push({
            text,
            who
        });
    }

    return (
        <div id="chat-div" className="bg-blue-100 rounded-lg p-12 text-lg space-y-8">
            {messageLog.map((message) => (
                message.who === 'user' ? (
                    <UserTextBubble>
                        {message.text}
                    </UserTextBubble>
                ) : (
                    <BotTextBubble>
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
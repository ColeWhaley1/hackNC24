interface BotBubbleProps {
    children: React.ReactNode
}

const BotTextBubble: React.FC<BotBubbleProps> = ({ children }) => {
    return (
        <div className="chat chat-start">
            <div className="chat-bubble">
                { children }
            </div>
        </div>
    );
}

export default BotTextBubble;
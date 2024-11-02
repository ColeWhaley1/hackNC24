interface UserBubbleProps {
    children: React.ReactNode
}

const UserTextBubble: React.FC<UserBubbleProps> = ({ children }) => {
    return (
        <div className="chat chat-end">
            <div className="chat-bubble chat-bubble-primary">
                { children }
            </div>
        </div>
    );
}

export default UserTextBubble;
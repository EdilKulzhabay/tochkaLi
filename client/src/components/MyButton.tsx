export const MyButton = ({ text, onClick, className, disabled }: { text: string, onClick: () => void, className?: string, disabled?: boolean }) => {
    return (
        <button 
            className={`w-full p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`} 
            onClick={onClick}
            disabled={disabled}
        >{text}</button>
    )
}
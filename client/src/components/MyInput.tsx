export const MyInput = ({ label, type, value, placeholder, onChange }: { label: string, type: string, value: string, placeholder?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium">{label}</label>
            <input 
                type={type} 
                value={value} 
                onChange={onChange} 
                className="w-full p-2 rounded-md border border-gray-300" 
                placeholder={placeholder}
            />
        </div>
    )
}
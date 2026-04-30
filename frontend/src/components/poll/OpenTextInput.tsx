import React from 'react';

interface OpenTextInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
}

const OpenTextInput: React.FC<OpenTextInputProps> = ({ value, onChange, placeholder = 'Type your answer here', rows = 4 }) => {
	return (
		<textarea
			rows={rows}
			value={value}
			placeholder={placeholder}
			onChange={(event) => onChange(event.target.value)}
			className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
		/>
	);
};

export default OpenTextInput;

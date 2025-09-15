export default function FilterButton({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void; }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-md text-sm ${active ? 'bg-indigo-700 text-white' : 'bg-white border text-slate-700'}`}
        >
            {children}
        </button>
    );
}
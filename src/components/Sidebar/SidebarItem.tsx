import TrashIcon from '../icons/TrashIcon';

interface Props {
    id: string;
    title: string;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function SidebarItem({ id, title, isActive, onSelect, onDelete }: Props) {
    return (
        <div
            className={`flex items-center mx-2.5 my-1 justify-between p-2 rounded-xl border-1 border-border cursor-pointer hover:bg-border dark:hover:bg-gray-700 ${isActive ? 'dark:bg-gray-800' : ''}`}
            onClick={() => onSelect(id)}
        >
            <span className="truncate text-text bg-bg">{title}</span>
            <button
                onClick={e => { e.stopPropagation(); onDelete(id); }}
                className="text-text hover:text-border"
            >
                <TrashIcon />
            </button>
        </div>
    );
}
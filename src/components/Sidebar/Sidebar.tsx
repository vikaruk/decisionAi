import type { Session } from '../../types';
import ThemeToggle from '../ThemeToggle';
import SidebarItem from './SidebarItem';

interface Props {
    sessions: Session[];
    currentSessionId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    sidebarOpen: boolean;
    onClose: () => void;
    onNew: () => void;
}

export default function Sidebar({ sessions, currentSessionId, onSelect, onDelete, sidebarOpen, onClose, onNew }: Props) {
    return (
        <>
            {sidebarOpen && <div className="fixed inset-0 bg-opacity-50 z-20 md:hidden" onClick={onClose} />}
            <aside className={`fixed flex flex-col inset-y-0 w-64 bg-surface z-30 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:z-auto`}>
                <div className="flex items-center bg-background justify-center p-4 h-[74px] ">
                    <span className="text-xl font-semibold text-white">Чати</span>

                    {/* <button onClick={onNew} className="text-blue-600 hover:text-blue-800 text-xl font-semibold cursor-pointer">+ Новий</button> */}
                </div>
                <div className="flex-1 overflow-y-auto border-r border-border flex flex-col">
                    <button onClick={onNew} className="p-2 rounded mx-2.5 my-1 border border-border text-primary cursor-pointer hover:bg-border dark:hover:bg-gray-700 active:opacity-75">
                        Створити чат
                    </button>
                    {sessions.map(s => (
                        <SidebarItem
                            key={s.id}
                            id={s.id}
                            title={s.title}
                            isActive={s.id === currentSessionId}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
                <div className="p-4 flex justify-center border-r border-border">
                    <ThemeToggle />
                </div>
            </aside>
        </>
    );
}
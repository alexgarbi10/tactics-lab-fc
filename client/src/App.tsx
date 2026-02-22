import { FormationEditor } from './components/FormationEditor';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur border-b border-gray-700/60 sticky top-0 z-40 shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">Tactics Lab FC</h1>
            <p className="text-xs text-gray-400 leading-none">Formation Builder</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-6 flex flex-col">
        <FormationEditor />
      </main>
    </div>
  );
}

export default App;

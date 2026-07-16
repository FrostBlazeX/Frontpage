import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Homepage from "./pages/Homepage";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <main className="flex-1 overflow-y-auto">
          <Homepage selectedCategory={selectedCategory} />
        </main>
      </div>
    </div>
  );
}
export default App;

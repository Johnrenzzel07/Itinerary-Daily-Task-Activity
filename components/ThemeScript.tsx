export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light";}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}

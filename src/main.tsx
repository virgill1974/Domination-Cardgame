import { render } from 'preact';
import '@fontsource/silkscreen/latin-400.css';
import '@fontsource/silkscreen/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource-variable/space-grotesk';
import './ui/theme.css';
import { App } from './ui/App';

render(<App />, document.getElementById('app')!);

import { render } from 'preact';
import '@fontsource-variable/exo-2';
import '@fontsource-variable/inter';
import './ui/theme.css';
import { App } from './ui/App';

render(<App />, document.getElementById('app')!);

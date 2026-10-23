import { ToolLogo, type Lang } from '@terapevti4no/ui';
import { tools, type Tool } from './tools';
import { Link } from 'react-router';

export function ToolCard({ tool, lang }: { tool: Tool; lang: Lang }) {
  const copy = tool.copy[lang];
  return <Link className="tool-card ui-card" to={tool.href} aria-labelledby={`${tool.id}-title`} aria-describedby={`${tool.id}-description`}>
    <div className="tool-heading"><h2 id={`${tool.id}-title`}>{tool.logo ? <ToolLogo name={tool.logo}/> : tool.name}</h2><span className="category">{copy.category}</span></div>
    <p id={`${tool.id}-description`} className="tool-description">{copy.description}</p>
    <ul className="features">{copy.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
  </Link>;
}

export function ToolCatalog({ lang }: { lang: Lang }) {
  return <div className="tool-catalog">{tools.map(tool => <ToolCard key={tool.id} tool={tool} lang={lang}/>)}</div>;
}

export function MoreToolsNote({ children }: { children: string }) {
  return <p className="collection-note"><span className="small-mark" aria-hidden="true">+</span>{children}</p>;
}

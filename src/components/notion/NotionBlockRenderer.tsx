import { TextRichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import { Quote } from '../Quote';

type Block = {
  type: string;
  id: string;
  [key: string]: any;
  callout?: {
    icon?: {
      type: string;
      emoji?: string;
    };
    rich_text: TextRichTextItemResponse[];
    children?: Block[];
  };
};

type Props = {
  block: Block;
};

export const NotionBlockRenderer = ({ block }: Props) => {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case 'paragraph':
      return (
        <p className="text-gray-800 dark:text-gray-200">
          <NotionText textItems={value.rich_text} />
        </p>
      );
    case 'heading_1':
      return (
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          <NotionText textItems={value.rich_text} />
        </h1>
      );
    case 'heading_2':
      return (
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          <NotionText textItems={value.rich_text} />
        </h2>
      );
    case 'heading_3':
      return (
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">
          <NotionText textItems={value.rich_text} />
        </h3>
      );
    case 'bulleted_list':
      return (
        <ul className="list-disc list-outside pl-5 text-gray-800 dark:text-gray-200">
          {value.children.map((block: Block) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
        </ul>
      );
    case 'numbered_list':
      return (
        <ol className="list-decimal list-outside pl-5 text-gray-800 dark:text-gray-200">
          {value.children.map((block: Block) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
        </ol>
      );
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return (
        <li className="pl-0 text-gray-800 dark:text-gray-200">
          <NotionText textItems={value.rich_text} />
          {!!value.children &&
            value.children.map((block: Block) => (
              <NotionBlockRenderer key={block.id} block={block} />
            ))}
        </li>
      );
    case 'to_do':
      return (
        <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            id={id}
            defaultChecked={value.checked}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
          />
          <label htmlFor={id}>
            <NotionText textItems={value.rich_text} />
          </label>
        </div>
      );
    case 'toggle':
      return (
        <details className="text-gray-800 dark:text-gray-200">
          <summary className="cursor-pointer">
            <NotionText textItems={value.rich_text} />
          </summary>
          <div className="pl-5 mt-2">
            {value.children?.map((block: Block) => (
              <NotionBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        </details>
      );
    case 'child_page':
      return <p className="text-gray-800 dark:text-gray-200">{value.title}</p>;
    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url;
      const caption = value.caption ? value.caption[0]?.plain_text : '';
      return (
        <figure className="my-4">
          <Image
            className="object-cover rounded-lg"
            placeholder="blur"
            src={src || "/placeholder.svg"}
            alt={caption}
            blurDataURL={value.placeholder}
            width={value.size.width}
            height={value.size.height}
          />
          {caption && (
            <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    case 'divider':
      return <hr key={id} className="my-4 border-gray-300 dark:border-gray-700" />;
    case 'quote':
      return <Quote key={id} quote={value.rich_text[0].plain_text} />;
    case 'code':
      return (
        <pre className={`language-${value.language} p-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto`}>
          <code key={id} className="text-sm text-gray-800 dark:text-gray-200">
            {value.rich_text[0].plain_text}
          </code>
        </pre>
      );
    case 'file':
      const src_file = value.type === 'external' ? value.external.url : value.file.url;
      const splitSourceArray = src_file.split('/');
      const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
      const caption_file = value.caption ? value.caption[0]?.plain_text : '';
      return (
        <figure className="my-4">
          <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
            <span>📎</span>
            <Link href={src_file} passHref className="text-blue-600 hover:underline dark:text-blue-400">
              {lastElementInArray.split('?')[0]}
            </Link>
          </div>
          {caption_file && (
            <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {caption_file}
            </figcaption>
          )}
        </figure>
      );
    case 'bookmark':
      const href = value.url;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {href}
        </a>
      );
    case 'callout':
      return (
        <div className="flex p-4 my-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          {value.icon && (
            <div className="flex-shrink-0 mr-4">
              {value.icon.type === 'emoji' ? value.icon.emoji : '📌'}
            </div>
          )}
          <div className="flex-grow text-gray-800 dark:text-gray-200">
            <NotionText textItems={value.rich_text} />
            {value.children?.map((block: Block) => (
              <NotionBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        </div>
      );
    default:
      return (
        <p className="text-red-600 dark:text-red-400">
          ❌ Unsupported block ({type === 'unsupported' ? 'unsupported by Notion API' : type})
        </p>
      );
  }
};

const NotionText = ({ textItems }: { textItems: TextRichTextItemResponse[] }) => {
  if (!textItems) {
    return null;
  }

  return (
    <>
      {textItems.map((textItem) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text,
        } = textItem;
        return (
          <span
            key={text.content}
            className={clsx({
              'font-bold': bold,
              'font-mono text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded': code,
              italic: italic,
              'line-through': strikethrough,
              underline: underline,
            })}
            style={color !== 'default' ? { color } : {}}
          >
            {text.link ? (
              <a href={text.link.url} className="text-blue-600 hover:underline dark:text-blue-400">
                {text.content}
              </a>
            ) : (
              text.content
            )}
          </span>
        );
      })}
    </>
  );
};


import Link from 'next/link'
import Head from 'next/head'

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <ol className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap py-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name}>
              <div className="flex items-center">
                {index > 0 && (
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-300 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                )}
                {isLast ? (
                  <span className="font-medium text-gray-800 cursor-default inline-block">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-blue-600 hover:text-blue-800 hover:underline underline-offset-4 transition-colors duration-200 inline-block"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs

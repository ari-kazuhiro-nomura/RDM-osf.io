from werkzeug.contrib.atom import AtomFeed


def build_query(q='*', start=0, size=10, sort=None):
    query = {
        'query': build_query_string(q),
        'from': start,
        'size': size,
    }

    if sort:
        query['sort'] = [
            {
                sort: 'desc'
            }
        ]

    return query


def build_query_string(q):
    return {
        'query_string': {
            'default_field': '_all',
            'query': q,
            'analyze_wildcard': True,
            'lenient': True  # TODO, may not want to do this
        }
    }


def create_atom_feed(name, data, query, size, start, url, to_atom):
    if query == '*':
        title_query = 'All'
    else:
        title_query = query

    title = '{name}: Atom Feed for query: "{title_query}"'.format(name=name, title_query=title_query)
    author = 'COS'

    links = [
        {'href': url, 'rel': 'first'},
        {'href': '{url}?page={page}'.format(url=url, page=(start / size) + 2), 'rel': 'next'},
        {'href': '{url}?page={page}'.format(url=url, page=(start / size)), 'rel': 'previous'}
    ]

    links = links[:-1] if (start / size) == 0 else links

    feed = AtomFeed(
        title=title,
        feed_url=url,
        author=author,
        links=links
    )

    for doc in data:
        feed.add(**to_atom(doc))

    return feed

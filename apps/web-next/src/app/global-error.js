'use client';
import React from 'react';

export default function GlobalError({ error, unstable_retry }) {
    return React.createElement('html', null,
        React.createElement('body', null,
            React.createElement('div', { style: { padding: '2rem', textAlign: 'center' } },
                React.createElement('h2', null, 'Something went wrong'),
                React.createElement('button', { onClick: () => unstable_retry() }, 'Try again')
            )
        )
    );
}

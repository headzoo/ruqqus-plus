import { createTemplateContent } from './web';

export const isAuthenticated = (username) => {
    return fetch('https://ruqqus.com/me')
        .then((resp) => resp.text())
        .then((text) => {
            const content = createTemplateContent(text);
            const link    = content.querySelector(`a[href="/@${username}"]`);

            return !!link;
        });
};

export const fetchUser = (username) => {
    return fetch(`https://ruqqus.com/api/v1/user/${username}`)
        .then((resp) => {
            if (!resp.ok) {
                throw new Error(`Received status code ${resp.status}`);
            }
            return resp.json();
        })
        .then((json) => {
            return json;
        });
};

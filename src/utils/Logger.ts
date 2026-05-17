const PREFIX = "[Formify]";

export const log = (...args: any[]) => {
    console.log(PREFIX, ...args);
};

export const warn = (...args: any[]) => {
    console.warn(PREFIX, ...args);
};

export const error = (...args: any[]) => {
    console.error(PREFIX, ...args);
};

export const group = (title: string, ...args: any[]) => {
    console.groupCollapsed(`${PREFIX} ${title}`);
    args.forEach((arg) => console.log(arg));
    console.groupEnd();
};

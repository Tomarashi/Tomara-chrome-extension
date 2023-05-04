interface Tomaraconfiguration {
    host: string
    test_path: string
    api_path: string
    word_param: string
    size_param: string
}

export {
    Tomaraconfiguration,
}

export default {
    host: "http://localhost:8081",
    test_path: "/word/greetings",
    api_path: "/word/get",
    word_param: "sub_word",
    size_param: "word_n",
};

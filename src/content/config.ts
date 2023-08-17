interface TomaraConfiguration {
    host: string
    test_path: string
    api_path: string
    word_param: string
    size_param: string
    request_id_param: string
}

export {
    TomaraConfiguration,
}

export default {
    host: "http://localhost:8081",
    test_path: "/extension/api/word/greetings",
    api_path: "/extension/api/word/get",
    word_param: "sub_word",
    size_param: "word_n",
    request_id_param: "request_id",
};

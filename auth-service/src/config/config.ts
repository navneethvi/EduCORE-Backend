export const config = {
    port : process.env.PORT || 3001,
    mongo: {
        uri :'mongodb://127.0.0.1:27017/Auth' 
    },
    JWT_SECRET : process.env.JWT_SECRET_KEY || 'jwtsecretkey'
}
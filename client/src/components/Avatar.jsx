function Avatar({
    avatar,
    size = "w-12 h-12",
    textSize = "text-lg"
}) {

    /*
    IMAGE AVATAR
    */

    if (
        avatar?.startsWith(
            "http"
        )
    ) {

        return (

            <img
                src={avatar}
                alt="avatar"
                className={`${size} rounded-full object-cover`}
            />

        );

    }

    /*
    LETTER AVATAR
    */

    return (

        <div
            className={`${size} rounded-full bg-green-600 flex items-center justify-center text-white font-bold ${textSize}`}
        >

            {avatar || "?"}

        </div>

    );

}

export default Avatar;
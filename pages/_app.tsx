import '../styles/globals.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import Head from 'next/head';

const queryClient = new QueryClient();

const MyApp = ({Component, pageProps}) => (
    <>
        <Head>
            <title>Phonetic translator — Order &amp; Chaos</title>
            <meta
                name="description"
                content="Translates languages to IPA phonetics"
            />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#39393D"/>
            <meta name="msapplication-TileColor" content="#39393d"/>
            <meta name="theme-color" content="#39393d"/>
        </Head>
        <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    </>

);

export default MyApp;

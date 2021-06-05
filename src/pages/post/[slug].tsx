import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router'
import { FiCalendar,FiUser } from "react-icons/fi";

import { RichText } from 'prismic-dom';


import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid:string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post} : PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }
   // TODO
   return (
     <div className={styles.container}>

       <img src={post.data.banner.url} alt="carregar" />
       <>
          <Head>
              <title> {post.data.title}</title>
         </Head>
         <main key={post.data.title} className={styles.container}>

                 <h1>{post.data.title}</h1>
                 <div className={styles.dataAuthor}>
                            <div className={styles.date}>
                              <FiCalendar />
                              <time>{post.first_publication_date}</time>
                            </div>
                      <div className={styles.author}>
                         <FiUser />
                         <span>{post.data.author}</span>
                      </div>

                  </div>
                  {
                    post.data.content.map((conteudo,index) => (
                      <div key={conteudo.heading}>
                        <h1 >{conteudo.heading}</h1>
                        {
                          conteudo.body.map((corpo,index) => (
                            <div key={index}>{corpo.text}</div>
                          ))
                        }
                      </div>
                    ))
                  }

         </main>
        </>
     </div>
   )
}


export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

  const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

  return {
      paths: [], //indicates that no page needs be created at build time
      fallback: true,
  }
}

export const getStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post',String(slug),{});

  const post = {
    uid:response.uid,
    first_publication_date: response.first_publication_date,
    data : {
      title: response.data.title,
      subtitle:response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author:response.data.author,
      content:response.data.content,
    }
  }

  return { props:{
              post
        }
      }

}

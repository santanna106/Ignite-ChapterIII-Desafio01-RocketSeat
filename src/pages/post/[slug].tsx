import {useState,useEffect} from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router'
import { FiCalendar,FiUser,FiClock } from "react-icons/fi";

import Prismic from '@prismicio/client';



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
  const [minutos,setMinutos] = useState(0);
  const router = useRouter()

  useEffect(() => {
    let linhas = [];
    post.data.content.forEach(conteudo => {
        linhas = [...linhas,conteudo.heading];
        conteudo.body.forEach(paragrafos => {
          linhas = [...linhas,paragrafos.text];
        })
      }
    )
    let minutos = Math.ceil( linhas.reduce(function (acumulador, valorAtual) {
      return acumulador + valorAtual.split(/\s/).length;
    }, 0)/200);
    setMinutos(minutos);
  },[post])

   if  (router.isFallback) {
     return <div><h1>Carregando...</h1></div>
   }

   // TODO
   return (

     router.isFallback
     ?
     <div><h1>Carregando...</h1></div>
     :
     <div className={styles.container}>

       <img src={post.data.banner.url} alt="carregar" />

          <Head>
              <title> {post.data.title}</title>
         </Head>

         <h1 className={styles.title}>{post.data.title}</h1>

         <main key={post.data.title} className={styles.containerMain}>

                 <div className={styles.dataAuthor}>
                            <div className={styles.date}>
                              <FiCalendar />
                              <time>{format(
	                                          new Date(post.first_publication_date),
	                                              "dd MMM yyyy",
	                                              {
		                                              locale: ptBR,
	                                              }
                                            )
                                     }
                               </time>
                            </div>
                      <div className={styles.author}>
                         <FiUser />
                         <span>{post.data.author}</span>
                      </div>
                      <div className={styles.author}>
                         <FiClock />
                         <span>{minutos} min</span>
                      </div>



                  </div>
                  {
                    post.data.content.map((conteudo,index) => (
                      <article className={styles.article} key={conteudo.heading}>
                        <h1 className={styles.subtitle}>{conteudo.heading}</h1>
                        {
                          conteudo.body.map((corpo,index) => (
                            <div className={styles.corpo} key={index}>{corpo.text}</div>
                          ))
                        }
                      </article>
                    ))
                  }

            <div><h1 className={styles.loading}>Carregando...</h1></div>
         </main>



     </div>
                )
}


export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

  const prismic = getPrismicClient();
  const posts = await prismic.query([ Prismic.predicates.at('document.type','post')]);

  let slugsObj = [];
  posts.results.forEach((elemento) => {
    let obj = {
      params: {
        slug:elemento.uid
      }
    }

    slugsObj = [...slugsObj,obj]
  })

  return {
      paths: slugsObj,
      fallback: true,
  }
}

export const getStaticProps:GetStaticProps = async ({ params }) => {
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

import {useState,useEffect} from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { FiCalendar,FiUser } from "react-icons/fi";

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

 export default function Home({postsPagination}: HomeProps) {
   const [postPaginacao,setPostPaginacao] = useState<PostPagination>(postsPagination);
   const [flagAtivaPaginacao,setFlagAtivaPaginacao] = useState(false);
   const [posts, setPosts] = useState<Post[]>([]);

   useEffect(()=> {

        postsPagination.results.map(post => {
          let resultPost = {
              uid:post.uid,
              first_publication_date: format(
                new Date(post.first_publication_date),
                "dd MMM yyyy",
                {
                  locale: ptBR,
                }
              ) ,
              data: {
                title:post.data.title,
                subtitle:post.data.subtitle,
                author:post.data.author
              }

            }

            setPosts(old => [...old, resultPost])
            return resultPost
      })

   },[])

   function proximaPagina(){


      fetch(postPaginacao.next_page)
      .then(response => response.json())
      .then(data =>  {
        setPostPaginacao({
                next_page: data.next_page,
                results:data.results.map(post => {
                  let resultPost = {
                    uid:post.uid,
                    first_publication_date: post.first_publication_date,

                    data: {
                      title:post.data.title,
                      subtitle:post.data.subtitle,
                      author:post.data.author
                    }

                  }
                  setPosts([...posts, resultPost])
                  return resultPost
          })
      })


    });


    setFlagAtivaPaginacao(true);
  }

   return(
        <div className={styles.contentContainer}>
        <main className={styles.container}>
            <div className={styles.posts}>
                 { posts.map(post => (
                    <Link key={post.uid} href={`/post/${post.uid}`} >
                        <a>
                          <h1 className={commonStyles.title}>{post.data.title}</h1>
                          <h3 className={styles.subtitle}>{post.data.subtitle}</h3>

                          <div className={styles.dataAuthor}>
                            <div className={styles.date}>
                              <FiCalendar />
                              <time>{ format(
                                new Date(post.first_publication_date),
                                "dd MMM yyyy",
                                {
                                  locale: ptBR,
                                }
                              )}</time>
                            </div>
                            <div className={styles.author}>
                              <FiUser />
                              <span>{post.data.author}</span>
                            </div>

                          </div>

                         </a>
                    </Link>
                 ))}


              {
                postPaginacao?.next_page &&
                <div className={styles.btnCarregar}>
                  <button type="button" onClick={()=> proximaPagina()}>
                        Carregar mais posts
                  </button>
                </div>
              }
            </div>
        </main>

       </div>


    )
 }

 export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
      Prismic.predicates.at('document.type','post')
  ], {
      fetch: ['post.title','post.subtitle','post.author'],
      pageSize:2,
    })



  const postsPagination = {
        next_page: response.next_page,
        results:response.results.map(post => {
          return {
            uid:post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title:post.data.title,
              subtitle:post.data.subtitle,
              author:post.data.author
            }

          }
        })
    }


  return {
      props : {postsPagination}

  }
}
